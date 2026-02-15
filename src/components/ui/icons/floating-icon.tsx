import { motion } from "framer-motion";

type FloatingIconProps = {
  children: React.ReactNode;
  className?: string;
};

const FloatingIcon = ({ children, className = "" }: FloatingIconProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`absolute ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default FloatingIcon;
