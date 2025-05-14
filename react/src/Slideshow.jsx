import { useState, useEffect } from "react";

const images = [
  "https://importanceoftechnology.net/wp-content/uploads/2020/10/Importance-of-Technology-in-the-Medical-Field.jpg",
  "https://www.national.edu/wp-content/uploads/2021/11/Nov_4_iStock-1127069581-scaled.jpeg",
  "https://www.openaccessgovernment.org/wp-content/uploads/2019/09/dreamstime_xxl_138422676-1920x1236.jpg",
  "https://www.uq.edu.au/news/filething/get/141199/EIAT%20medical%20hub.jpg",
];

const Slideshow = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] relative">
      <img
        src={images[index]}
        alt="Slideshow"
        className="w-full h-full object-cover rounded-full shadow-lg"
      />

    </div>
  );
};

export default Slideshow;
