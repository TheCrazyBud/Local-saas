"use client";

import { useState } from 'react';

export default function DeployButton() {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 2000);
  };

  return (
    <button className="btn" onClick={handleDeploy}>
      {isDeploying ? 'Deploying...' : 'Deploy New Data Plane'}
    </button>
  );
}
