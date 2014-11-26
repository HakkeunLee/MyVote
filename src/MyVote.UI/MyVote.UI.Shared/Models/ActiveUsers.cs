﻿using Newtonsoft.Json;

namespace MyVote.UI.Models
{
	public class ActiveUsers
	{
		public int Id { get; set; }

		[JsonProperty(PropertyName = "AuthnToken")]
		public string AuthenticationToken { get; set; }

		[JsonProperty(PropertyName = "containerName")]
		public string ContainerName { get; set; }

		[JsonProperty(PropertyName = "resourceName")]
		public string ResourceName { get; set; }

		[JsonProperty(PropertyName = "sas")]
		public string SharedAccessSignature { get; set; }
	}
}