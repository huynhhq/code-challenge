import { SwapCard } from './components/SwapCard';
import { TokenProvider } from './context/TokenContext';

function App() {
  return (
    <TokenProvider>
      <main className="container">
        <SwapCard />
        <footer className="footer">
          <p>
            Powered by <strong>Switcheo</strong>
          </p>
        </footer>
      </main>
    </TokenProvider>
  );
}

export default App;
