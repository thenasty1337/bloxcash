// This page is now handled by the unified Slots component
// The Slots component detects the /favorites route and shows favorites instead.
import Slots from "./slots";

function Favorites() {
  // The Slots component will detect the /favorites route
  // and show the favorites instead of regular slots with the same design
  return <Slots />;
}

export default Favorites; 