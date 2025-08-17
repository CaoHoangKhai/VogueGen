const BASE_URL = " https://e9abdbb4dc05.ngrok-free.app";

export const BASE_URL_TRY_ON = `${BASE_URL}/tryon`;
export const BASE_URL_UPLOAD_DESIGN = `${BASE_URL}/upload_design`;

const API_BASE_URL_TRY_ON = "http://localhost:4000/try_on";

export const addTryOnImage = async (manguoidung, base64Data) => {
  try {
    const response = await fetch(`${API_BASE_URL_TRY_ON}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ manguoidung, data: base64Data }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add try-on image");
    }
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error("addTryOnImage error:", error);
    throw error;
  }
};

export const deleteTryOnImage = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL_TRY_ON}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete try-on image");
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("deleteTryOnImage error:", error);
    throw error;
  }
};

export const getTryOnImagesByUser = async (manguoidung) => {
  try {
    const response = await fetch(`${API_BASE_URL_TRY_ON}/user/${manguoidung}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch try-on images");
    }
    const images = await response.json();
    return images;
  } catch (error) {
    console.error("getTryOnImagesByUser error:", error);
    throw error;
  }
};

