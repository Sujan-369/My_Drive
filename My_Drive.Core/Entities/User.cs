namespace My_Drive.Core.Entities;

public sealed class User
{
    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public string Email { get; private set; } = null!;
    public string DisplayName { get; private set; } = null!;
    public string GoogleSubjectId { get; private set; } = null!;

    private User() { }

    public User(Guid organizationId, string email, string displayName, string googleSubjectId)
    {
        if (organizationId == Guid.Empty)
        {
            throw new ArgumentException("User must belong to a valid Organization.", nameof(organizationId));
        }
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email cannot be empty.", nameof(email));
        }
        if (string.IsNullOrWhiteSpace(googleSubjectId))
        {
            throw new ArgumentException("GoogleSubjectId cannot be empty.", nameof(googleSubjectId));
        }

        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        Email = email;
        DisplayName = displayName;
        GoogleSubjectId = googleSubjectId;
    }
}