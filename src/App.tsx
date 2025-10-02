// src/App.tsx
import Scene from "./scene/scene";
import { SelectAsteroid } from "./ui/SelectAsteroid";

function App() {
  //return <SelectAsteroid />;
  return (
    <div className="w-full h-screen">
      <Scene />
    </div>
  );
}

export default App;
