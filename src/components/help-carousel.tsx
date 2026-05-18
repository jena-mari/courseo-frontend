import slider1 from '../assets/slider1.png';
import slider2 from '../assets/slider2.png';
import slider3 from '../assets/slider3.png';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  X, HelpCircle
} from "lucide-react";


export function HelpSlider({ onClose }: { onClose: () => void }) {
  const swiperInstanceRef = useRef<Swiper | null>(null);

  useEffect(() => {
    //run after DOM rendered so the arrows show up
    swiperInstanceRef.current = new Swiper('.swiper', {
      modules: [Navigation, Pagination],
      loop: true,
      watchOverflow: false,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true
      }
    });

    //prevent duplicates
    return () => {
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-white rounded-[40px] shadow-xl w-full max-w-2xl p-8 relative overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#000181] transition-colors"
        >
          <X size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[rgba(131,231,255,0.5)] rounded-xl flex items-center justify-center">
            <HelpCircle size={20} className="text-[#000181]" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#000181] tracking-tight">
            How to use Courseo
          </h2>
        </div>
     

        <div>
          <div className="swiper">
            <div className="swiper-wrapper text-center pb-8">
              <div className="swiper-slide">
                <div className='h-[320px] flex flex-col justify-center items-center'>
                  <img className='object-contain' src={slider1} alt=''></img>
                  <p className='pt-6'>Log into SOLS and navigate to <span className='font-bold text-[#000181]'>Enrolment Record</span></p>
                </div>
              </div>
              <div className="swiper-slide">
                <div className='h-[320px] flex flex-col justify-center items-center'>
                  <img className='object-contain' src={slider2} alt=''></img>
                  <p className='pt-1'>Copy your enrolment record from Course to the end of the table</p>
                </div>
              </div>
              <div className="swiper-slide">
                <div className='h-[320px] flex flex-col justify-center items-center'>
                  <img className='object-contain' src={slider3} alt=''></img>
                  <p className='pt-3'>Paste your copied enrolment record as in into the Courseo chat interface to generate your study plan!</p>
                </div>
              </div>
            </div>
            
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
            
            <div className="swiper-pagination"></div>
          </div>
            
        </div>


      </motion.div>
    </motion.div>
  );
  
}