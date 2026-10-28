import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import heroImg from '../assets/images/hero.jpg';
import storyImg from '../assets/images/story.jpg';

const FEATURES = [
  ['leaf', 'Fresh Ingredients', 'Locally sourced'],
  ['box', 'Authentic Recipes', 'Traditional flavours'],
  ['users', 'Family Friendly', 'A space for everyone'],
  ['heart', 'Loved by Many', '4.8+ Ratings'],
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="wrap">
      <section className="hero r">
        <div>
          <div className="eye">GOOD FOOD · WARM HEARTS · ALWAYS HOME</div>
          <h1>Homestyle Food for <em>Happier Days</em></h1>
          <p>Authentic Indian flavours, freshly prepared with simple ingredients and a whole lot of love. At GharBhoj, every meal feels like home.</p>
          <button className="btn" onClick={() => navigate('/menu')}>Explore Menu →</button>{' '}
          <button className="btn o" onClick={() => navigate('/book')}>Book a Table</button>{' '}
          <button className="btn t" onClick={() => navigate('/order')}>Order Food →</button>
        </div>
        <div className="hf"><img src={heroImg} alt="Paneer butter masala with rice and naan" /></div>
      </section>

      <div className="feat">
        {FEATURES.map(([icon, title, sub]) => (
          <div key={title}>
            <Icon name={icon} size={30} />
            <p style={{ margin: 0 }}><b>{title}</b><span>{sub}</span></p>
          </div>
        ))}
      </div>

      <section className="hero sty" style={{ paddingTop: 0 }}>
        <div>
          <div className="eye">OUR STORY</div>
          <h2>A Kitchen that Feels Like Home</h2>
          <p>GharBhoj started with a simple idea: to serve food that reminds you of home. Rooted in Indian traditions and made with fresh ingredients, we bring people together over meals that feel familiar, comforting and full of flavour.</p>
          <button className="btn" onClick={() => navigate('/menu')}>Our Story →</button>
        </div>
        <img src={storyImg} alt="Traditional Indian kitchen with spices" />
      </section>
    </div>
  );
}
