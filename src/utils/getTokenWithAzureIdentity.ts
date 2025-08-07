import { InteractiveBrowserCredential, type GetTokenOptions, type InteractiveBrowserCredentialInBrowserOptions } from "@azure/identity";

async function validateRedirectUri(
    redirectUri: string,
): Promise<boolean> {
    try {
        // Check if redirect URI is accessible
        const response = await fetch(redirectUri, {
            method: "HEAD",
            mode: "no-cors",
            redirect: "follow",
        });
        if (response.status !== 200) {
            throw new Error(`Redirect URI ${redirectUri} is not accessible. Please ensure the callback page exists.`);
        }
    } catch (fetchError) {
        console.warn("Could not verify redirect URI accessibility:", fetchError);
        // Continue anyway as HEAD requests might be blocked
        return false;
    }

    return true;
}

export async function getTokenWithAzureIdentity(clientId: string, tenantId: string, redirectUri: string) {
    await validateRedirectUri(redirectUri);

    // Use the provided scope
    const tokenScopes = ["https://cognitiveservices.azure.com/.default"];

    try {
        const interactiveBrowserCredentialInBrowserOptions: InteractiveBrowserCredentialInBrowserOptions = {
            clientId,
            tenantId,
            additionallyAllowedTenants: ["*"],
            redirectUri,
            loginStyle: "popup", // Use popup login style becauze from iframe
        };
        const credential = new InteractiveBrowserCredential(interactiveBrowserCredentialInBrowserOptions);
        const getTokenOptions: GetTokenOptions = {
            tenantId,
            requestOptions: {
                timeout: 30000, // Set a timeout for the token request
            },
        };

        const tokenResult = await credential.getToken(tokenScopes, getTokenOptions);
        return tokenResult.token;
    } catch (err) {
        const error = err as Error & { errorCode : string };
        console.error("Error getting token with Azure Identity:", error);

        // Handle specific error types
        if (error?.errorCode === "user_cancelled") {
            throw new Error("Authentication was cancelled by the user. Please try again and complete the sign-in process.");
        } else if (error?.errorCode === "popup_window_error") {
            throw new Error("Authentication popup was blocked. Please allow popups for this site and try again.");
        } else if (error?.message?.includes("timeout")) {
            throw new Error("Authentication timed out. Please check your network connection and try again.");
        } else if (error?.message?.includes("network")) {
            throw new Error("Network error during authentication. Please check your connection and try again.");
        }

        // Re-throw with more user-friendly message
        throw new Error(`Authentication failed: ${error?.message || "Unknown error"}. Please try again or contact support.`);
    }
}