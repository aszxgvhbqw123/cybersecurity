import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage: React.FC = () => {
    const { cart, cartTotal, clearCart, currentUser, enrollInCourse } = useAppContext();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentStatus('processing');
        // Simulate API call
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
                // Enroll in courses after successful payment
                if (currentUser && cart.length > 0) {
                    cart.forEach(item => enrollInCourse(item.id));
                }
                clearCart();
                navigate('/my-courses');
            }, 3000);
        }, 2000);
    };

    if (paymentStatus === 'success') {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                 <svg className="mx-auto h-16 w-16 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-3xl font-bold text-text-primary mt-4">Payment Successful!</h1>
                <p className="text-text-secondary mt-2">Thank you for your purchase. You will be redirected to your courses shortly.</p>
            </div>
        );
    }
    
    if (cart.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h1 className="text-3xl font-bold text-text-primary">Your Cart is Empty</h1>
                <p className="text-text-secondary mt-2">Add some courses to get started.</p>
                <button onClick={() => navigate('/courses')} className="mt-6 bg-accent-blue text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition">
                    Browse Courses
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-text-primary mb-8 text-center">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-secondary p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b border-gray-700 pb-2">
                                <span className="text-text-primary">{item.title}</span>
                                <span className="font-semibold text-text-primary">${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center text-xl font-bold">
                        <span className="text-text-primary">Total</span>
                        <span className="text-accent-green">${cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-secondary p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 bg-white px-2 py-1 rounded"/>
                        <p className="font-semibold text-text-secondary">via Al-Kuraimi Bank</p>
                    </div>
                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label htmlFor="card-name" className="block text-sm font-medium text-text-secondary">Name on Card</label>
                            <input type="text" id="card-name" required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                         <div>
                            <label htmlFor="card-number" className="block text-sm font-medium text-text-secondary">Card Number</label>
                            <input type="text" id="card-number" placeholder="xxxx xxxx xxxx xxxx" required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="expiry" className="block text-sm font-medium text-text-secondary">Expiry (MM/YY)</label>
                                <input type="text" id="expiry" placeholder="MM/YY" required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="cvc" className="block text-sm font-medium text-text-secondary">CVC</label>
                                <input type="text" id="cvc" placeholder="123" required className="mt-1 block w-full bg-primary border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-accent-blue focus:border-accent-blue" />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={paymentStatus === 'processing'}
                            className="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-accent-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:bg-gray-500 disabled:cursor-wait"
                        >
                            {paymentStatus === 'processing' ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;