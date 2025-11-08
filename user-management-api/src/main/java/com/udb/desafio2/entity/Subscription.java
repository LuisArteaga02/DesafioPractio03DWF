package com.udb.desafio2.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


    public Subscription() {
    }

    public Subscription(String type, LocalDate startDate, LocalDate endDate, User user) {
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.user = user;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return (today.isEqual(startDate) || today.isAfter(startDate)) &&
                (today.isEqual(endDate) || today.isBefore(endDate));
    }

    public boolean isValid() {
        return endDate.isAfter(startDate) || endDate.isEqual(startDate);
    }

    @Override
    public String toString() {
        return "Subscription{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", userId=" + (user != null ? user.getId() : "null") +
                '}';
    }
}