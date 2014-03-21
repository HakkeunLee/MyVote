﻿using System.Diagnostics.CodeAnalysis;
using MyVote.BusinessObjects.Contracts;
using MyVote.UI.W8.Tests.Mocks.Base;

namespace MyVote.UI.W8.Tests.Mocks
{
	[SuppressMessage("Microsoft.Naming", "CA1710:IdentifiersShouldHaveCorrectSuffix")]
	public class PollCommentCollectionMock : BusinessListBaseCoreMock<IPollComment> { }
}
