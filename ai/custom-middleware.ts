import { Experimental_LanguageModelV1Middleware } from "ai";

/**
 * Custom middleware for language model with request/response logging and error handling
 */
export const customMiddleware: Experimental_LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const startTime = Date.now();
    
    try {
      const result = await doGenerate();
      const duration = Date.now() - startTime;
      
      // Log successful requests in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`AI Generation completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log errors without exposing them to users
      if (process.env.NODE_ENV === 'development') {
        console.error(`AI Generation failed after ${duration}ms:`, error);
      }
      
      throw error;
    }
  },
  
  wrapStream: async ({ doStream, params }) => {
    const startTime = Date.now();
    
    try {
      const result = await doStream();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`AI Stream started at ${new Date(startTime).toISOString()}`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`AI Stream failed after ${duration}ms:`, error);
      }
      
      throw error;
    }
  },
};
