export default function Navigation({ games, activeGame, setActiveGame }) {
  return (
    <nav className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => setActiveGame(game.id)}
          className={`cyber-button ${activeGame === game.id ? 'cyber-button-active' : ''}`}
        >
          {game.name}
        </button>
      ))}
    </nav>
  );
}