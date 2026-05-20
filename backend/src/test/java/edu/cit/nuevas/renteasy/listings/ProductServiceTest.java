package edu.cit.nuevas.renteasy.listings;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import edu.cit.nuevas.renteasy.cart.CartItemRepository;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void addProductMapsListingPayloadAndOwner() {
        User owner = new User();
        owner.setEmail("owner@example.com");

        ProductRequest request = new ProductRequest();
        request.setName("Camera Kit");
        request.setDescription("DSLR with lens");
        request.setPrice(BigDecimal.valueOf(45.50));
        request.setStock(2);
        request.setCategory("electronics");
        request.setImageUrl("data:image/png;base64,abc");
        request.setOwnerEmail(owner.getEmail());

        when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = productService.addProduct(request);

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        Product captured = productCaptor.getValue();

        assertSame(captured, saved);
        assertEquals("Camera Kit", captured.getName());
        assertEquals("DSLR with lens", captured.getDescription());
        assertEquals(45.50, captured.getPrice());
        assertEquals(2, captured.getStock());
        assertEquals("electronics", captured.getCategory());
        assertEquals("data:image/png;base64,abc", captured.getImageUrl());
        assertSame(owner, captured.getOwner());
    }

    @Test
    void deleteProductRemovesCartReferencesBeforeProduct() {
        when(productRepository.existsById(10L)).thenReturn(true);

        productService.deleteProduct(10L);

        InOrder orderedDeletes = inOrder(cartItemRepository, productRepository);
        orderedDeletes.verify(cartItemRepository).deleteByProduct_ProductId(10L);
        orderedDeletes.verify(productRepository).deleteById(10L);
    }
}
