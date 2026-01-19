import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product_model.dart';
import '../models/category_model.dart';

/// Service for fetching products and categories from Firebase
class ProductService {
  static const String databaseURL = 'https://sham-coffee-default-rtdb.firebaseio.com';
  static const String restaurantId = 'sham-coffee-1';

  /// Fetch all categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/categories/$restaurantId.json');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data == null) return _getDefaultCategories();

        final List<CategoryModel> categories = [];
        if (data is Map) {
          data.forEach((key, value) {
            if (value is Map) {
              categories.add(CategoryModel.fromMap(key, Map<String, dynamic>.from(value)));
            }
          });
        }

        // Sort by sortOrder
        categories.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
        return categories.isEmpty ? _getDefaultCategories() : categories;
      }
    } catch (e) {
      print('Error fetching categories: $e');
    }
    return _getDefaultCategories();
  }

  /// Fetch all products
  Future<List<ProductModel>> getProducts() async {
    try {
      final url = Uri.parse('$databaseURL/restaurant-system/products/$restaurantId.json');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data == null) return _getDefaultProducts();

        final List<ProductModel> products = [];
        if (data is Map) {
          data.forEach((key, value) {
            if (value is Map) {
              final product = ProductModel.fromMap(key, Map<String, dynamic>.from(value));
              if (product.isAvailable) {
                products.add(product);
              }
            }
          });
        }

        return products.isEmpty ? _getDefaultProducts() : products;
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
    return _getDefaultProducts();
  }

  /// Fetch products by category
  Future<List<ProductModel>> getProductsByCategory(String categoryId) async {
    final products = await getProducts();
    if (categoryId == 'all') return products;
    return products.where((p) => p.categoryId == categoryId).toList();
  }

  /// Search products
  Future<List<ProductModel>> searchProducts(String query) async {
    final products = await getProducts();
    final lowerQuery = query.toLowerCase();
    return products.where((p) {
      return p.name.toLowerCase().contains(lowerQuery) ||
          p.nameAr.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  /// Default categories for demo/fallback
  List<CategoryModel> _getDefaultCategories() {
    return [
      CategoryModel(id: 'coffee', name: 'Coffee', nameAr: 'قهوة', icon: '☕', sortOrder: 0),
      CategoryModel(id: 'tea', name: 'Tea', nameAr: 'شاي', icon: '🍵', sortOrder: 1),
      CategoryModel(id: 'cold', name: 'Cold Drinks', nameAr: 'مشروبات باردة', icon: '🧊', sortOrder: 2),
      CategoryModel(id: 'desserts', name: 'Desserts', nameAr: 'حلويات', icon: '🍰', sortOrder: 3),
      CategoryModel(id: 'snacks', name: 'Snacks', nameAr: 'وجبات خفيفة', icon: '🥪', sortOrder: 4),
      CategoryModel(id: 'shisha', name: 'Shisha', nameAr: 'شيشة', icon: '💨', sortOrder: 5),
    ];
  }

  /// Default products for demo/fallback
  List<ProductModel> _getDefaultProducts() {
    return [
      // Coffee
      ProductModel(
        id: 'espresso',
        name: 'Espresso',
        nameAr: 'إسبريسو',
        categoryId: 'coffee',
        price: 12,
        variants: [
          ProductVariant(id: 'single', name: 'Single', nameAr: 'سنجل', priceModifier: 0),
          ProductVariant(id: 'double', name: 'Double', nameAr: 'دبل', priceModifier: 5),
        ],
      ),
      ProductModel(
        id: 'americano',
        name: 'Americano',
        nameAr: 'أمريكانو',
        categoryId: 'coffee',
        price: 15,
        variants: [
          ProductVariant(id: 'small', name: 'Small', nameAr: 'صغير', priceModifier: 0),
          ProductVariant(id: 'large', name: 'Large', nameAr: 'كبير', priceModifier: 5),
        ],
      ),
      ProductModel(
        id: 'latte',
        name: 'Latte',
        nameAr: 'لاتيه',
        categoryId: 'coffee',
        price: 18,
        variants: [
          ProductVariant(id: 'small', name: 'Small', nameAr: 'صغير', priceModifier: 0),
          ProductVariant(id: 'large', name: 'Large', nameAr: 'كبير', priceModifier: 5),
        ],
        addons: [
          ProductAddon(id: 'caramel', name: 'Caramel', nameAr: 'كراميل', price: 3),
          ProductAddon(id: 'vanilla', name: 'Vanilla', nameAr: 'فانيلا', price: 3),
          ProductAddon(id: 'hazelnut', name: 'Hazelnut', nameAr: 'بندق', price: 3),
        ],
      ),
      ProductModel(
        id: 'cappuccino',
        name: 'Cappuccino',
        nameAr: 'كابتشينو',
        categoryId: 'coffee',
        price: 18,
        variants: [
          ProductVariant(id: 'small', name: 'Small', nameAr: 'صغير', priceModifier: 0),
          ProductVariant(id: 'large', name: 'Large', nameAr: 'كبير', priceModifier: 5),
        ],
      ),
      ProductModel(
        id: 'mocha',
        name: 'Mocha',
        nameAr: 'موكا',
        categoryId: 'coffee',
        price: 20,
      ),
      ProductModel(
        id: 'turkish_coffee',
        name: 'Turkish Coffee',
        nameAr: 'قهوة تركية',
        categoryId: 'coffee',
        price: 10,
      ),

      // Tea
      ProductModel(
        id: 'black_tea',
        name: 'Black Tea',
        nameAr: 'شاي أسود',
        categoryId: 'tea',
        price: 8,
      ),
      ProductModel(
        id: 'green_tea',
        name: 'Green Tea',
        nameAr: 'شاي أخضر',
        categoryId: 'tea',
        price: 10,
      ),
      ProductModel(
        id: 'mint_tea',
        name: 'Mint Tea',
        nameAr: 'شاي بالنعناع',
        categoryId: 'tea',
        price: 10,
      ),
      ProductModel(
        id: 'chamomile',
        name: 'Chamomile',
        nameAr: 'بابونج',
        categoryId: 'tea',
        price: 12,
      ),

      // Cold Drinks
      ProductModel(
        id: 'iced_latte',
        name: 'Iced Latte',
        nameAr: 'آيس لاتيه',
        categoryId: 'cold',
        price: 20,
      ),
      ProductModel(
        id: 'iced_americano',
        name: 'Iced Americano',
        nameAr: 'آيس أمريكانو',
        categoryId: 'cold',
        price: 18,
      ),
      ProductModel(
        id: 'frappe',
        name: 'Frappe',
        nameAr: 'فرابيه',
        categoryId: 'cold',
        price: 22,
        variants: [
          ProductVariant(id: 'coffee', name: 'Coffee', nameAr: 'قهوة', priceModifier: 0),
          ProductVariant(id: 'caramel', name: 'Caramel', nameAr: 'كراميل', priceModifier: 2),
          ProductVariant(id: 'chocolate', name: 'Chocolate', nameAr: 'شوكولاتة', priceModifier: 2),
        ],
      ),
      ProductModel(
        id: 'fresh_juice',
        name: 'Fresh Juice',
        nameAr: 'عصير طازج',
        categoryId: 'cold',
        price: 15,
        variants: [
          ProductVariant(id: 'orange', name: 'Orange', nameAr: 'برتقال', priceModifier: 0),
          ProductVariant(id: 'lemon', name: 'Lemon Mint', nameAr: 'ليمون نعناع', priceModifier: 0),
          ProductVariant(id: 'mango', name: 'Mango', nameAr: 'مانجو', priceModifier: 3),
        ],
      ),

      // Desserts
      ProductModel(
        id: 'chocolate_cake',
        name: 'Chocolate Cake',
        nameAr: 'كيكة شوكولاتة',
        categoryId: 'desserts',
        price: 25,
      ),
      ProductModel(
        id: 'cheesecake',
        name: 'Cheesecake',
        nameAr: 'تشيز كيك',
        categoryId: 'desserts',
        price: 28,
      ),
      ProductModel(
        id: 'tiramisu',
        name: 'Tiramisu',
        nameAr: 'تيراميسو',
        categoryId: 'desserts',
        price: 30,
      ),

      // Snacks
      ProductModel(
        id: 'croissant',
        name: 'Croissant',
        nameAr: 'كرواسون',
        categoryId: 'snacks',
        price: 12,
        variants: [
          ProductVariant(id: 'plain', name: 'Plain', nameAr: 'سادة', priceModifier: 0),
          ProductVariant(id: 'chocolate', name: 'Chocolate', nameAr: 'شوكولاتة', priceModifier: 3),
          ProductVariant(id: 'cheese', name: 'Cheese', nameAr: 'جبنة', priceModifier: 3),
        ],
      ),
      ProductModel(
        id: 'sandwich',
        name: 'Club Sandwich',
        nameAr: 'كلوب ساندويتش',
        categoryId: 'snacks',
        price: 35,
      ),

      // Shisha
      ProductModel(
        id: 'shisha_regular',
        name: 'Regular Shisha',
        nameAr: 'شيشة عادية',
        categoryId: 'shisha',
        price: 50,
        variants: [
          ProductVariant(id: 'grape', name: 'Grape', nameAr: 'عنب', priceModifier: 0),
          ProductVariant(id: 'mint', name: 'Mint', nameAr: 'نعناع', priceModifier: 0),
          ProductVariant(id: 'apple', name: 'Apple', nameAr: 'تفاح', priceModifier: 0),
          ProductVariant(id: 'mixed', name: 'Mixed', nameAr: 'مكس', priceModifier: 5),
        ],
      ),
      ProductModel(
        id: 'shisha_premium',
        name: 'Premium Shisha',
        nameAr: 'شيشة بريميوم',
        categoryId: 'shisha',
        price: 70,
        variants: [
          ProductVariant(id: 'blueberry', name: 'Blueberry', nameAr: 'توت أزرق', priceModifier: 0),
          ProductVariant(id: 'watermelon', name: 'Watermelon', nameAr: 'بطيخ', priceModifier: 0),
          ProductVariant(id: 'gum', name: 'Gum', nameAr: 'علكة', priceModifier: 0),
        ],
      ),
    ];
  }
}

