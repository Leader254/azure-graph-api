using Azure.Identity;
using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Consumer;
using Azure.Messaging.EventHubs.Producer;
using System.Text;

class Program
{
    static async Task Main(string[] args)
    {
        string namespaceURL = "";
        string eventHubName = "";

        // Use InteractiveBrowserCredential with proper tenant and client ID
        var credential = new InteractiveBrowserCredential(new InteractiveBrowserCredentialOptions
        {
            TenantId = "",
            ClientId = "",
        });

        // Create the Event Hub producer client
        var producerClient = new EventHubProducerClient(namespaceURL, eventHubName, credential);

        try
        {
            // Create a batch of events 
            using EventDataBatch eventBatch = await producerClient.CreateBatchAsync();
            int numOfEvents = 3;
            var random = new Random();

            for (int i = 1; i <= numOfEvents; i++)
            {
                int randomNumber = random.Next(1, 101);
                string eventBody = $"Event {randomNumber}";
                if (!eventBatch.TryAdd(new EventData(Encoding.UTF8.GetBytes(eventBody))))
                {
                    throw new Exception($"Event {i} is too large for the batch and cannot be sent.");
                }
            }

            await producerClient.SendAsync(eventBatch);
            Console.WriteLine($"A batch of {numOfEvents} events has been published.");
            Console.WriteLine("Press Enter to retrieve and print the events...");
            Console.ReadLine();
        }
        finally
        {
            await producerClient.DisposeAsync();
        }

        // Create an EventHubConsumerClient using the same credential
        await using var consumerClient = new EventHubConsumerClient(
            EventHubConsumerClient.DefaultConsumerGroupName,
            namespaceURL,
            eventHubName,
            credential);

        Console.Clear();
        Console.WriteLine("Retrieving all events from the hub...");

        long totalEventCount = 0;
        string[] partitionIds = await consumerClient.GetPartitionIdsAsync();

        foreach (var partitionId in partitionIds)
        {
            PartitionProperties properties = await consumerClient.GetPartitionPropertiesAsync(partitionId);
            if (properties.LastEnqueuedSequenceNumber >= properties.BeginningSequenceNumber)
            {
                totalEventCount += (properties.LastEnqueuedSequenceNumber - properties.BeginningSequenceNumber + 1);
            }
        }

        int retrievedCount = 0;
        await foreach (PartitionEvent partitionEvent in consumerClient.ReadEventsAsync(startReadingAtEarliestEvent: true))
        {
            if (partitionEvent.Data != null)
            {
                string body = Encoding.UTF8.GetString(partitionEvent.Data.Body.ToArray());
                Console.WriteLine($"Retrieved event: {body}");
                retrievedCount++;
                if (retrievedCount >= totalEventCount)
                {
                    Console.WriteLine("Done retrieving events. Press Enter to exit...");
                    Console.ReadLine();
                    return;
                }
            }
        }
    }
}
