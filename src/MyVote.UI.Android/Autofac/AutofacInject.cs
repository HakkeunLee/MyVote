using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using System.Reflection;
using Autofac;

namespace MyVote.UI.Droid
{
	public static class AutofacInject
	{
		public static IContainer Container { get; private set; }

		public static void ResolveAutofacDependencies(this object obj){
			// Bootstrap
			if (Container == null) {
				Container = new Bootstrapper ().Bootstrap ();
			}

			PropertyInfo[] properties =
				obj.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);            

			foreach (var property in properties.Where(p=>p.GetCustomAttributes(typeof(InjectAttribute), false).Any())) {

				object instance = null;
				if (!Container.TryResolve (property.PropertyType, out instance)) {
					throw new InvalidOperationException ("Could not resolve type " + property.PropertyType.ToString ());
				}

				property.SetValue (obj, instance);
			}
		}
	}
}

