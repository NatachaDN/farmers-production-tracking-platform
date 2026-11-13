package com.farmer.tracking.modules.crop.repository;

import com.farmer.tracking.modules.crop.entity.ReferenceCrop;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceCropRepository extends JpaRepository<ReferenceCrop, Long> {
    List<ReferenceCrop> findAllByOrderByNameAsc();
    List<ReferenceCrop> findByEnabledTrueOrderByNameAsc();
}
