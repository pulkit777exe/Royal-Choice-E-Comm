import { useState, useEffect } from 'react';
import { Navbar } from "../components/Navbar";
import { ProductGrid } from "../components/ProductGrid";
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_API_URL}/product/all-products`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                
                if (response.data.success) {
                    setProducts(response.data.products);
                } else {
                    setError("Failed to load products");
                    toast.error("Failed to load products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products");
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
            <Navbar />
            <div className="pt-20">
                <ProductGrid 
                    products={products} 
                    loading={loading} 
                    error={error} 
                />
            </div>
        </div>
    );
}