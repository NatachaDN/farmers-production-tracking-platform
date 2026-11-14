package com.farmer.tracking.modules.farm.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "farm_maps")
public class FarmMap {
    @Id
    private Long farmId;
    private String mediaType;
    @Lob
    @Column(length = 5242880, nullable = false)
    private byte[] image;

    protected FarmMap() {}

    public FarmMap(Long farmId, String mediaType, byte[] image) {
        this.farmId = farmId;
        this.mediaType = mediaType;
        this.image = image;
    }

    public String getMediaType() { return mediaType; }
    public byte[] getImage() { return image; }
}
