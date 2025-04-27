export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token found");
  
    const response = await fetch("http://localhost:8080/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
  
    const data = await response.json();
    localStorage.setItem("token", data.accessToken); // 새로운 access token 저장
    return data.accessToken;
  };
  