using Microsoft.Graph;
using Azure.Identity;
using dotenv.net;
DotEnv.Load();
var envVars = DotEnv.Read();

// Read Azure AD app registration values from environment
string clientId = envVars["CLIENT_ID"];
string tenantId = envVars["TENANT_ID"];

// Validate that required environment variables are set
if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(tenantId))
{
    Console.WriteLine("Please set CLIENT_ID and TENANT_ID environment variables.");
    return;
}
// Define the Microsoft Graph permission scopes required by this app
var scopes = new[] { "User.Read" };

// Configure interactive browser authentication for the user
var options = new InteractiveBrowserCredentialOptions
{
    ClientId = clientId, // Azure AD app client ID
    TenantId = tenantId, // Azure AD tenant ID
    RedirectUri = new Uri("http://localhost") // Redirect URI for auth flow
};
var credential = new InteractiveBrowserCredential(options);

// Create a Microsoft Graph client using the credential
var graphClient = new GraphServiceClient(credential);

// Retrieve and display the user's profile information
Console.WriteLine("Retrieving user profile...");
await GetUserProfile(graphClient);

// Function to get and print the signed-in user's profile
async Task GetUserProfile(GraphServiceClient graphClient)
{
    try
    {
        // Call Microsoft Graph /me endpoint to get user info
        var me = await graphClient.Me.GetAsync();
        Console.WriteLine($"Display Name: {me?.DisplayName}");
        Console.WriteLine($"Principal Name: {me?.UserPrincipalName}");
        Console.WriteLine($"User Id: {me?.Id}");
    }
    catch (Exception ex)
    {
        // Print any errors encountered during the call
        Console.WriteLine($"Error retrieving profile: {ex.Message}");
    }
}
