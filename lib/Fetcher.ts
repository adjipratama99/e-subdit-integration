import { FetchPostParams } from "@/types/general";

export async function fetchPost(data: FetchPostParams<any>) {
    let headers: { [key: string]: string } = {
        'Accept': 'application/json'
    };
  
    let body;
  
    if (data.body instanceof FormData) {
        // Jangan set Content-Type biar browser auto-set boundary-nya
        body = data.body;
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data.body);
    }
  
    const rawResponse = await fetch(data.url, {
        method: 'POST',
        headers,
        body
    });
  
    const response = await rawResponse.json().catch(() => null);
  
    if (!rawResponse.ok) {
        return {
            code: rawResponse.status,
            content: response?.content || null,
            message: response?.message || rawResponse.statusText || 'Unknown error'
        };
    }
  
    return response;
  }
  