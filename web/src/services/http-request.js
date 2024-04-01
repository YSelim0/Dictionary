// without using axios
export default class HttpRequestService {
  apiBaseURL = "";

  constructor(apiBaseURL) {
    this.apiBaseURL = apiBaseURL;
  }

  async get(url) {
    const response = await fetch(this.apiBaseURL + url);
    return await response.json();
  }

  async post(url, data) {
    const response = await fetch(this.apiBaseURL + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async postFormData(url, formData) {
    const response = await fetch(this.apiBaseURL + url, {
      method: "POST",
      body: formData,
    });
    return await response.json();
  }

  async put(url, data) {
    const response = await fetch(this.apiBaseURL + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async delete(url) {
    const response = await fetch(this.apiBaseURL + url, {
      method: "DELETE",
    });
    return await response.json();
  }
}
