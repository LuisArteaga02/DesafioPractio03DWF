package com.udb.desafio2.controller;

import com.udb.desafio2.dto.SubscriptionRequestDTO;
import com.udb.desafio2.entity.Subscription;
import com.udb.desafio2.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@Tag(name = "Subscriptions", description = "Subscription management endpoints")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping
    @Operation(summary = "Create subscription", description = "Create a new subscription for a user")
    public ResponseEntity<Subscription> createSubscription(@Valid @RequestBody SubscriptionRequestDTO subscriptionRequest) {
        Subscription subscription = subscriptionService.createSubscription(subscriptionRequest);
        return ResponseEntity.ok(subscription);
    }

    @GetMapping
    @Operation(summary = "Get all subscriptions")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subscription by ID")
    public ResponseEntity<Subscription> getSubscriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get subscriptions by user")
    public ResponseEntity<List<Subscription>> getSubscriptionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByUser(userId));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active subscriptions")
    public ResponseEntity<List<Subscription>> getActiveSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getActiveSubscriptions());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete subscription")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}