package com.udb.desafio2.service;

import com.udb.desafio2.dto.SubscriptionRequestDTO;
import com.udb.desafio2.entity.Subscription;
import com.udb.desafio2.entity.User;
import com.udb.desafio2.exception.ResourceNotFoundException;
import com.udb.desafio2.repository.SubscriptionRepository;
import com.udb.desafio2.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    public Subscription createSubscription(SubscriptionRequestDTO subscriptionRequest) {
        User user = userRepository.findById(subscriptionRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + subscriptionRequest.getUserId()));

        if (!subscriptionRequest.getEndDate().isAfter(subscriptionRequest.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        Subscription subscription = new Subscription();
        subscription.setType(subscriptionRequest.getType());
        subscription.setStartDate(subscriptionRequest.getStartDate());
        subscription.setEndDate(subscriptionRequest.getEndDate());
        subscription.setUser(user);

        return subscriptionRepository.save(subscription);
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public Subscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
    }

    public List<Subscription> getSubscriptionsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return subscriptionRepository.findByUserId(userId);
    }

    public List<Subscription> getActiveSubscriptions() {
        return subscriptionRepository.findActiveSubscriptions(LocalDate.now());
    }

    public void deleteSubscription(Long id) {
        if (!subscriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subscription not found with id: " + id);
        }
        subscriptionRepository.deleteById(id);
    }
}