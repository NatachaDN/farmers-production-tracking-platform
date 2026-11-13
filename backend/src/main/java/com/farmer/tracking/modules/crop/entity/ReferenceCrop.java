package com.farmer.tracking.modules.crop.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reference_crops")
public class ReferenceCrop {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(name = "normalized_name", nullable = false, unique = true, length = 120)
    private String normalizedName;
    @Column(nullable = false)
    private boolean enabled;

    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isEnabled() { return enabled; }

    public void update(String name, String normalizedName, boolean enabled) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.enabled = enabled;
    }
}
