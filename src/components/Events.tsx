"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";

export default function Events() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('http://localhost:8001/api/v1/public/events');
                const data = await res.json();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        };
        fetchEvents();
    }, []);

    if (events.length === 0) return null;

    return (
        <section className="py-24 bg-white" id="events">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-[#000000] mb-4">Upcoming Events</h2>
                        <p className="text-gray-500 font-medium">Join us in our latest activities across the group</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-[#F8FAFC] rounded-[32px] overflow-hidden border border-gray-100 hover:border-accent/20 transition-all hover:shadow-xl hover:shadow-accent/5"
                        >
                            <div className="aspect-[16/10] overflow-hidden relative">
                                {event.image_path ? (
                                    <img
                                        src={`http://localhost:8001/storage/${event.image_path}`}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-accent/5 flex items-center justify-center text-accent/20">
                                        <Calendar size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest shadow-sm">
                                    {event.tenant?.name}
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 text-xs font-bold text-accent uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </span>
                                    {event.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {event.location}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[#000000] mb-3 group-hover:text-accent transition-colors">
                                    {event.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-6">
                                    {event.description}
                                </p>
                                <button className="text-primary font-bold text-sm border-b-2 border-primary/10 hover:border-accent transition-all pb-0.5">
                                    Learn More →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
