using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

string keyVaultUrl = "https://mykeyvaultname751.vault.azure.net/";

// create the client
DefaultAzureCredentialOptions options = new()
{
    ExcludeEnvironmentCredential = true,
    ExcludeManagedIdentityCredential = true,
};

var client = new SecretClient(new Uri(keyVaultUrl), new DefaultAzureCredential(options));

// code to create a menu system
while (true)
{
    // Display menu options to the user
    Console.Clear();
    Console.WriteLine("\nPlease select an option:");
    Console.WriteLine("1. Create a new secret");
    Console.WriteLine("2. List all secrets");
    Console.WriteLine("Type 'quit' to exit");
    Console.Write("Enter your choice: ");

    string? input = Console.ReadLine()?.Trim().ToLower();

    if (input == "quit")
    {
        Console.WriteLine("Goodbye!");
        break;
    }

    switch (input)
    {
        case "1":
            // Call the method to create a new secret
            await CreateSecretAsync(client);
            break;
        case "2":
            // Call the method to list all existing secrets
            await ListSecretsAsync(client);
            break;
        default:
            Console.WriteLine("Invalid option. Please enter 1, 2, or 'quit'.");
            break;
    }
}

async Task CreateSecretAsync(SecretClient client)
{
    try
    {
        Console.WriteLine("\nCreating a new secret...");

        Console.Write("Enter secret name: ");
        string? secretName = Console.ReadLine()?.Trim();

        if (string.IsNullOrEmpty(secretName))
        {
            Console.WriteLine("Secret name cannot be empty.");
            return;
        }

        Console.Write("Enter secret value: ");
        string? secretValue = Console.ReadLine()?.Trim();

        if (string.IsNullOrEmpty(secretValue))
        {
            Console.WriteLine("Secret value cannot be empty.");
            return;
        }

        var secret = new KeyVaultSecret(secretName, secretValue);

        await client.SetSecretAsync(secret);

        Console.WriteLine($"Secret '{secretName}' created successfully!");
        Console.WriteLine("Press Enter to continue...");
        Console.ReadLine();
    } catch(Exception ex)
    {
        Console.WriteLine($"Error creating secret: {ex.Message}");

    }
}

async Task ListSecretsAsync(SecretClient client)
{
    try
    {
        Console.Clear();
        Console.WriteLine("Listing all secrets in the Key Vault...");
        Console.WriteLine("----------------------------------------");

        var secretProperties = client.GetPropertiesOfSecretsAsync();
        bool hasSecrets = false;

        await foreach (var secretProperty in secretProperties)
        {
            hasSecrets = true;
            try
            {
                var secret = await client.GetSecretAsync(secretProperty.Name);

                // Display the secret information to the console
                Console.WriteLine($"Name: {secret.Value.Name}");
                Console.WriteLine($"Value: {secret.Value.Value}");
                Console.WriteLine($"Created: {secret.Value.Properties.CreatedOn}");
                Console.WriteLine("----------------------------------------");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving secret '{secretProperty.Name}': {ex.Message}");
                Console.WriteLine("----------------------------------------");
            }
        }

        if (!hasSecrets)
        {
            Console.WriteLine("No secrets found in the Key Vault.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error listing secrets: {ex.Message}");

    }
    Console.WriteLine("Press Enter to continue...");
    Console.ReadLine();
}