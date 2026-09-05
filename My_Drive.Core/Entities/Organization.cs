namespace My_Drive.Core.Entities;

public sealed class Organization
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }

    // EF Core needs a parameterless constructor to materialize rows
    // from the database later. Never call this directly yourself —
    // it exists for the ORM, not for your code.
    private Organization() { }

    public Organization(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Organization name cannot be empty.", nameof(name));
        }

        Id = Guid.NewGuid();
        Name = name;
        CreatedAt = DateTime.UtcNow;
    }
}