
import api from "./api";

export type TemplateUploadData = {
  title: string;
  description: string;
  category: string;
  software: string;
  tags: string;
  thumbnail: File;
  previews: File[];
  templateFile: File;
};

export async function uploadTemplate(data: TemplateUploadData) {
  const token = sessionStorage.getItem("srivora_admin_token");

  if (!token) {
    throw new Error("Admin authentication required");
  }

  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("category", data.category);
  formData.append("software", data.software);
  formData.append("tags", data.tags);

  formData.append("thumbnail", data.thumbnail);

  data.previews.forEach((file) => {
    formData.append("previews", file);
  });

  formData.append("templateFile", data.templateFile);

  const response = await api.post("/templates", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 120000,
  });

  return response.data;
}
