package edu.cit.nuevas.renteasy.cart;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import edu.cit.nuevas.renteasy.listings.Product;
import edu.cit.nuevas.renteasy.listings.ProductRepository;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    @Test
    void addItemToCartCreatesNewCartItemWhenProductIsNotYetInCart() {
        Product product = new Product();
        User user = new User();
        user.setEmail("buyer@example.com");

        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByProduct_ProductIdAndUser_Email(10L, "buyer@example.com"))
                .thenReturn(Optional.empty());

        cartService.addItemToCart(10L, "buyer@example.com");

        ArgumentCaptor<CartItem> cartCaptor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartRepository).save(cartCaptor.capture());
        CartItem savedItem = cartCaptor.getValue();

        assertSame(product, savedItem.getProduct());
        assertSame(user, savedItem.getUser());
        assertEquals(1, savedItem.getDays());
        assertEquals("buyer@example.com", savedItem.getUserEmail());
    }

    @Test
    void addItemToCartIncrementsExistingDays() {
        Product product = new Product();
        User user = new User();
        CartItem existingItem = new CartItem();
        existingItem.setDays(2);

        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(user));
        when(cartRepository.findByProduct_ProductIdAndUser_Email(10L, "buyer@example.com"))
                .thenReturn(Optional.of(existingItem));

        cartService.addItemToCart(10L, "buyer@example.com");

        assertEquals(3, existingItem.getDays());
        verify(cartRepository).save(existingItem);
    }

    @Test
    void updateDaysPersistsChangedDays() {
        CartItem existingItem = new CartItem();
        existingItem.setDays(1);

        when(cartRepository.findById(1L)).thenReturn(Optional.of(existingItem));

        cartService.updateDays(1L, 4);

        assertEquals(4, existingItem.getDays());
        verify(cartRepository).save(existingItem);
    }
}
