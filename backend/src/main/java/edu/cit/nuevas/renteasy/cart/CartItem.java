package edu.cit.nuevas.renteasy.cart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import edu.cit.nuevas.renteasy.listings.Product;
import edu.cit.nuevas.renteasy.users.User;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "days", nullable = false)
    private Integer days = 1;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public CartItem() {}

    @PrePersist
    protected void onCreate() {
        if (days == null || days < 1) {
            days = 1;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days == null || days < 1 ? 1 : days; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    @JsonProperty("userEmail")
    public String getUserEmail() { return user == null ? null : user.getEmail(); }
}
