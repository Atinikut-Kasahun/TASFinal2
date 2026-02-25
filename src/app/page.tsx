"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Culture from "@/components/Culture";
import JobBoard from "@/components/JobBoard";
import Impact from "@/components/Impact";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main>
            <Header />
            <Hero />
            <Features />
            <Culture />
            <JobBoard />
            <Impact />
            <Footer />
        </main>
    );
}
