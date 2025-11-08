package com.udb.desafio2.repository;

import com.udb.desafio2.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserId(Long userId);

    @Query("SELECT s FROM Subscription s WHERE s.startDate <= :today AND s.endDate >= :today")
    List<Subscription> findActiveSubscriptions(@Param("today") LocalDate today);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.startDate <= :today AND s.endDate >= :today")
    List<Subscription> findActiveSubscriptionsByUser(@Param("userId") Long userId, @Param("today") LocalDate today);
}