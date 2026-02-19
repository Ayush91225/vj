export const getGenderBadgeStyle = (gender) => {
  return gender === "Female" 
    ? { bg: "#fce7f3", color: "#be185d" } 
    : { bg: "#eff6ff", color: "#1d4ed8" };
};

export const formatSpeed = (speed) => speed.toFixed(2);
