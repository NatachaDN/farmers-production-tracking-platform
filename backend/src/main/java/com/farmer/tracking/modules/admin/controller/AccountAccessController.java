package com.farmer.tracking.modules.admin.controller;

import com.farmer.tracking.common.audit.AuditEventType;
import com.farmer.tracking.common.audit.AuditService;
import com.farmer.tracking.common.exception.BadRequestException;
import com.farmer.tracking.common.exception.ForbiddenException;
import com.farmer.tracking.common.exception.ResourceNotFoundException;
import com.farmer.tracking.common.security.UserPrincipal;
import com.farmer.tracking.modules.auth.model.Farmer.AccessStatus;
import com.farmer.tracking.modules.auth.repository.FarmerRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/admin/farmers", "/api/v1/manager/farmers"})
public class AccountAccessController {
    private final FarmerRepository accounts;
    private final AuditService audit;

    public AccountAccessController(FarmerRepository accounts, AuditService audit) {
        this.accounts = accounts;
        this.audit = audit;
    }

    @PutMapping("/{id}/access")
    @Transactional
    public void update(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal actor,
            @Valid @RequestBody Change request, HttpServletRequest http) {
        if (actor.getId().equals(id)) throw new BadRequestException("Ask another administrator to change your access.");
        var account = accounts.findLockedById(id).orElseThrow(() -> new ResourceNotFoundException("Farmer", id));
        boolean admin = actor.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && (!Objects.equals(account.getManagerId(), actor.getId())
                || !account.getRole().equals("ROLE_FARMER"))) {
            throw new ResourceNotFoundException("Farmer", id);
        }
        if (account.getRole().equals("ROLE_ADMIN")) {
            throw new ForbiddenException("Administrator accounts are managed through the deployment configuration.");
        }

        String role = request.role() == null ? account.getRole() : request.role().name();
        Long managerId = admin ? request.managerId() : account.getManagerId();
        if (!admin && (request.role() != null || request.managerId() != null
                || account.getAccessStatus() != AccessStatus.PENDING
                || (request.status() != AccessStatus.ACTIVE && request.status() != AccessStatus.REJECTED))) {
            throw new ForbiddenException("Managers can approve or decline assigned registrations.");
        }
        if (managerId != null && !Objects.equals(managerId, account.getManagerId())) {
            if (!role.equals("ROLE_FARMER") || managerId.equals(id)) throw new BadRequestException("Only farmer accounts can be assigned to a manager.");
            if (accounts.findById(managerId).filter(manager -> manager.getRole().equals("ROLE_MANAGER")
                    && manager.getAccessStatus() == AccessStatus.ACTIVE).isEmpty()) {
                throw new BadRequestException("Select an active manager.");
            }
        }
        if (managerId != null && !role.equals("ROLE_FARMER")) throw new BadRequestException("Only farmer accounts can be assigned to a manager.");
        if (role.equals(account.getRole()) && request.status() == account.getAccessStatus()
                && Objects.equals(managerId, account.getManagerId())) return;

        account.setAccessStatus(request.status());
        account.setRole(role);
        account.setManagerId(managerId);
        account.setTokenVersion(account.getTokenVersion() + 1);
        audit.recordRequired(AuditEventType.ACCOUNT_ACCESS_CHANGED, actor.getId(), actor.getUsername(),
                "Account " + id + " set to " + role + " / " + request.status()
                        + (managerId == null ? "" : ", manager " + managerId), http);
    }

    public enum Role { ROLE_FARMER, ROLE_MANAGER }
    public record Change(@NotNull AccessStatus status, Role role, Long managerId) {}
}
