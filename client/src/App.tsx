import { useEffect, useState } from "react";

function App() {
  const [forecast, setForecast] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:5271/weatherforecast")
      .then((res) => res.json())
      .then((data) => setForecast(data))
      .catch((err) => console.error("Fetch failed:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My_Drive — connection test</h1>
      {forecast.length === 0 ? (
        <p>Loading (or nothing came back — check the console)...</p>
      ) : (
        <pre>{JSON.stringify(forecast, null, 2)}</pre>
      )}
    </div>
  );
}

export default App;