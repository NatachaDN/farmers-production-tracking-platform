package com.farmer.tracking.modules.farm.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "farm_tasks", indexes = @Index(name = "idx_farm_task_date", columnList = "farmer_id,due_date"))
public class FarmTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;
    @Column(nullable = false, length = 140)
    private String title;
    @Column(name = "due_date", nullable = false)
    private LocalDate date;
    @Column(nullable = false)
    private boolean completed;

    protected FarmTask() {}
    public FarmTask(Long farmerId, String title, LocalDate date) {
        this.farmerId = farmerId;
        this.title = title;
        this.date = date;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDate getDate() { return date; }
    public boolean isCompleted() { return completed; }
    public void complete() { completed = true; }
}
