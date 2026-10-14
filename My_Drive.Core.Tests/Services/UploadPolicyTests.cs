using My_Drive.Core.Models;
using My_Drive.Core.Services;
using Xunit;

namespace My_Drive.Core.Tests.Services;

public class UploadPolicyTests
{
    private static UploadPolicy Create() =>
        new(new UploadPolicyOptions(1000, new HashSet<string> { ".exe" }));

    [Fact]
    public void NormalFile_IsOk() => Assert.True(Create().Validate("report.pdf", 500).IsOk);

    [Fact]
    public void FileWithoutExtension_IsOk() => Assert.True(Create().Validate("README", 10).IsOk);

    [Fact]
    public void OverTheLimit_IsTooLargeAndNamesTheFile()
    {
        var result = Create().Validate("movie.mp4", 5000);

        Assert.Equal(ServiceStatus.TooLarge, result.Status);
        Assert.Contains("movie.mp4", result.Message);
    }

    [Theory]
    [InlineData("setup.exe")]
    [InlineData("SETUP.EXE")]
    public void BlockedExtension_IsUnsupportedRegardlessOfCase(string name)
    {
        var result = Create().Validate(name, 10);

        Assert.Equal(ServiceStatus.UnsupportedType, result.Status);
        Assert.Contains(".exe", result.Message);
    }
}