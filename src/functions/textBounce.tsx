import { motion } from "framer-motion";

export default function textBounce(words : string, classname : string, bounce : number) {
  
  // Container variant to handle layout orchestration
  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1, // Delays the start of each child animation
      },
    },
  };

  // Individual letter animation properties
  const letterVariants = {
    animate: {
      y: [0, bounce, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1.5, // Rest period before repeating the wave
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div 
        variants={containerVariants} 
        initial="initial"
        animate="animate"
        className={classname}
    >
      {words.split("").map((letter, index) => (
        <motion.span key={index} variants={letterVariants} className="inline-block">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}