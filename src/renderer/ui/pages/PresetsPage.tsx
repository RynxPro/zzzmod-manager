import React, { useState } from "react";
import PresetsManager from "../../components/PresetsManager";

const PresetsPage: React.FC = () => {
  const [searchQuery] = useState("");

  return (
    <div className="p-6 text-moon-text max-w-4xl mx-auto">
      <PresetsManager searchQuery={searchQuery} />
    </div>
  );
};

export default PresetsPage;
