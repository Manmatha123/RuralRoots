
import React, { useEffect } from 'react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Product } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

const productsData = [
  {
    id: 1,
    name: "Hand-Painted Ceramic Vase",
    image: "/images/product-1.jpg",
    price: 49.99,
    category: "Artwork",
    artist: "Emma Johnson"
  },
  {
    id: 2,
    name: "Rustic Wooden Photo Frame",
    image: "/images/product-2.jpg",
    price: 29.99,
    category: "Photo Frames",
    artist: "Michael Clark"
  },
  {
    id: 3,
    name: "Intricate Pencil Portrait",
    image: "/images/product-3.jpg",
    price: 199.99,
    category: "Pencil Art",
    artist: "Sarah Williams"
  },
  {
    id: 4,
    name: "Handwoven Wall Hanging",
    image: "/images/product-4.jpg",
    price: 89.99,
    category: "Wall Art",
    artist: "Jessica Lee"
  },
  {
    id: 5,
    name: "Handmade Leather Journal",
    image: "/images/product-5.jpg",
    price: 34.99,
    category: "Handcrafts",
    artist: "David Rodriguez"
  },
  {
    id: 6,
    name: "Abstract Oil Painting",
    image: "/images/product-6.jpg",
    price: 259.99,
    category: "Artwork",
    artist: "Thomas Wilson"
  },
  {
    id: 7,
    name: "Wildlife Pencil Sketch Collection",
    image: "/images/product-7.jpg",
    price: 149.99,
    category: "Pencil Art",
    artist: "Rebecca Davis"
  },
  {
    id: 8,
    name: "Handcrafted Metal Photo Frame",
    image: "/images/product-8.jpg",
    price: 45.99,
    category: "Photo Frames",
    artist: "John Miller"
  }
];

const FeaturedProducts = () => {
  const BASE_URL = import.meta.env.VITE_API_URL;
const [productList,setProductList]=React.useState<Product[]>([]);
const navigate=useNavigate();


  useEffect(() => {
    fetchLatestProductList();
  }, []);
 
  const fetchLatestProductList = async () => {
    const res = await axios.get(`${BASE_URL}/v1/public/api/product/filter-latest?page=0&size=8`);
    setProductList(res.data.content);
  }
  // /v1/public/api/product/filter-latest
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-craft-900 mb-2">Featured Products</h2>
            <p className="text-craft-700">Handpicked items crafted with attention to detail</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button variant="outline" onClick={()=>navigate("/filter")}>View All Products</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productList.map((product) => (
            <ProductCard 
              key={product.id}
              id={Number(product.id)}
              name={product.name}
              image={product.image}
              price={product.price}
              category={product.category}
              artist={product?.seller?.name}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
