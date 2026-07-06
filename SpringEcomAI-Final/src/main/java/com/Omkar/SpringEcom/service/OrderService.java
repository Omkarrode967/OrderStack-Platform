package com.Omkar.SpringEcom.service;

import com.Omkar.SpringEcom.model.Order;
import com.Omkar.SpringEcom.model.OrderItem;
import com.Omkar.SpringEcom.model.Product;
import com.Omkar.SpringEcom.model.dto.OrderItemRequest;
import com.Omkar.SpringEcom.model.dto.OrderItemResponse;
import com.Omkar.SpringEcom.model.dto.OrderRequest;
import com.Omkar.SpringEcom.model.dto.OrderResponse;
import com.Omkar.SpringEcom.repo.OrderRepo;
import com.Omkar.SpringEcom.repo.ProductRepo;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage; // <-- ADDED THIS IMPORT
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private VectorStore vectorStore;

    @Autowired
    private JavaMailSender mailSender;

    // --- FEATURE TOGGLE ---
    @Value("${app.feature.ai-enabled:false}")
    private boolean isAiEnabled;

    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {

        Order order = new Order();
        String orderId = "ORD" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
        order.setOrderId(orderId);
        order.setCustomerName(request.customerName());
        order.setEmail(request.email());
        order.setStatus("PLACED");
        order.setOrderDate(LocalDate.now());

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest itemReq : request.items()) {

            Product product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // 1. Core DB Update
            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepo.save(product);

            // 2. AI Update (Safely Wrapped)
            if (isAiEnabled) {
                try {
                    String filter = String.format("productId == %s", String.valueOf(product.getId()));
                    vectorStore.delete(filter);

                    String updatedContent = String.format("""
                        Product Name : %s
                        Description: %s
                        Brand: %s
                        Category: %s
                        Price: %.2f
                        Release Date: %s
                        Available: %s
                        Stock: %d
                        """,
                            product.getName(),
                            product.getDescription(),
                            product.getBrand(),
                            product.getCategory(),
                            product.getPrice(),
                            product.getReleaseDate(),
                            product.isProductAvailable(),
                            product.getStockQuantity()
                    );

                    Document updatedDoc = new Document(
                            UUID.randomUUID().toString(),
                            updatedContent,
                            Map.of("productId" , String.valueOf(product.getId()))
                    );

                    vectorStore.add(List.of(updatedDoc));
                } catch (Exception e) {
                    System.err.println("Warning: AI Vector update failed for product " + product.getId() + " - " + e.getMessage());
                }
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.quantity())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())))
                    .order(order)
                    .build();
            orderItems.add(orderItem);

        }

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepo.save(order);

        // --- NEW: FIRE OFF THE EMAIL ---
        sendOrderConfirmationEmail(savedOrder);

        // 3. AI Order Summary (Safely Wrapped)
        if (isAiEnabled) {
            try {
                StringBuilder content = new StringBuilder();

                content.append("Order Summary: \n");
                content.append("Order ID: ").append(savedOrder.getOrderId()).append("\n");
                content.append("Customer: ").append(savedOrder.getCustomerName()).append("\n");
                content.append("Email: ").append(savedOrder.getEmail()).append("\n");
                content.append("Date: ").append(savedOrder.getOrderDate()).append("\n");
                content.append("Status: ").append(savedOrder.getStatus()).append("\n");
                content.append("Products:\n");

                for(OrderItem orderItem : savedOrder.getOrderItems()){
                    content.append("- ").append(orderItem.getProduct().getName())
                            .append(" x ").append(orderItem.getQuantity())
                            .append(" = ₹").append(orderItem.getTotalPrice()).append("\n");
                }

                Document document = new Document(
                        UUID.randomUUID().toString(),
                        content.toString(),
                        Map.of("orderId", savedOrder.getOrderId())
                );
                vectorStore.add(List.of(document));
            } catch (Exception e) {
                System.err.println("Warning: AI Vector generation failed for order " + savedOrder.getOrderId() + " - " + e.getMessage());
            }
        }

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        for (OrderItem item : order.getOrderItems()) {
            OrderItemResponse orderItemResponse = new OrderItemResponse(
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getTotalPrice()
            );
            itemResponses.add(orderItemResponse);
        }

        OrderResponse orderResponse = new OrderResponse(
                savedOrder.getOrderId(),
                savedOrder.getCustomerName(),
                savedOrder.getEmail(),
                savedOrder.getStatus(),
                savedOrder.getOrderDate(),
                itemResponses
        );

        return orderResponse;
    }

    @Transactional
    public List<OrderResponse> getAllOrderResponses() {

        List<Order> orders = orderRepo.findAll();
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (Order order : orders) {

            List<OrderItemResponse> itemResponses = new ArrayList<>();

            for(OrderItem item : order.getOrderItems()) {
                OrderItemResponse orderItemResponse = new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()
                );
                itemResponses.add(orderItemResponse);

            }
            OrderResponse orderResponse = new OrderResponse(
                    order.getOrderId(),
                    order.getCustomerName(),
                    order.getEmail(),
                    order.getStatus(),
                    order.getOrderDate(),
                    itemResponses
            );
            orderResponses.add(orderResponse);
        }

        return orderResponses;
    }

    @Transactional
    public List<OrderResponse> getOrdersByEmail(String email) {
        List<Order> orders = orderRepo.findByEmail(email);
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (Order order : orders) {
            List<OrderItemResponse> itemResponses = new ArrayList<>();

            for(OrderItem item : order.getOrderItems()) {
                OrderItemResponse orderItemResponse = new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getTotalPrice()
                );
                itemResponses.add(orderItemResponse);
            }

            OrderResponse orderResponse = new OrderResponse(
                    order.getOrderId(),
                    order.getCustomerName(),
                    order.getEmail(),
                    order.getStatus(),
                    order.getOrderDate(),
                    itemResponses
            );
            orderResponses.add(orderResponse);
        }

        return orderResponses;
    }

    // --- NEW: EMAIL BUILDER METHOD ---
    private void sendOrderConfirmationEmail(Order order) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(order.getEmail());
            message.setSubject("Order Confirmation - " + order.getOrderId() + " | OrderStack");

            StringBuilder emailBody = new StringBuilder();
            emailBody.append("Hello ").append(order.getCustomerName()).append(",\n\n");
            emailBody.append("Thank you for shopping with OrderStack! Your order has been successfully placed.\n\n");

            emailBody.append("--- ORDER DETAILS ---\n");
            emailBody.append("Order ID: ").append(order.getOrderId()).append("\n");
            emailBody.append("Order Date: ").append(order.getOrderDate()).append("\n");
            emailBody.append("Status: ").append(order.getStatus()).append("\n\n");

            emailBody.append("--- ITEMS ---\n");
            BigDecimal total = BigDecimal.ZERO;
            for (OrderItem item : order.getOrderItems()) {
                emailBody.append("• ").append(item.getProduct().getName())
                        .append(" (Qty: ").append(item.getQuantity()).append(") - ₹")
                        .append(item.getTotalPrice()).append("\n");
                total = total.add(item.getTotalPrice());
            }

            emailBody.append("\n---------------------------\n");
            emailBody.append("TOTAL AMOUNT: ₹").append(total).append("\n");
            emailBody.append("---------------------------\n\n");

            emailBody.append("We will notify you as soon as your order ships.\n\n");
            emailBody.append("Best regards,\n");
            emailBody.append("The OrderStack Team");

            message.setText(emailBody.toString());
            mailSender.send(message);
            System.out.println("Order confirmation email sent successfully to " + order.getEmail());

        } catch (Exception e) {
            System.err.println("Warning: Failed to send order confirmation email - " + e.getMessage());
        }
    }
}