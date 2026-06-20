
export const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (error) => reject(new Error(`Script load error: ${error}`));
      document.body.appendChild(script);
    });
  };
  
  // Helper function to check if script is already loaded
  export const isScriptLoaded = (src: string): boolean => {
    return !!document.querySelector(`script[src="${src}"]`);
  };