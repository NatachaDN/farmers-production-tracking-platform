package com.farmer.tracking.modules.animal.model;

/**
 * Supported livestock / animal categories in Acrea.
 */
public enum AnimalType {
    CATTLE("Cattle"),
    POULTRY("Poultry"),
    GOATS("Goats"),
    SHEEP("Sheep"),
    PIGS("Pigs"),
    RABBITS("Rabbits"),
    BEES("Bees"),
    FISH("Fish"),
    OTHER("Other");

    private final String displayName;

    AnimalType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static AnimalType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return OTHER;
        }
        String clean = value.trim().toUpperCase();
        for (AnimalType type : values()) {
            if (type.name().equalsIgnoreCase(clean) || type.displayName.equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        return OTHER;
    }
}
