You are all set up. Next, add our <PricingTable /> component to your app, so your users can subscribe to your plans. Then use our SDKs to gate functionality in your app's codebase by using our has() method and <Protect /> component. Learn more by reading our guide.

Clerk billing for B2C SaaS allows you to create plans and manage subscriptions for individual users in your application. If you'd like to charge companies or organizations, see Billing for B2B SaaS. You can also combine both B2C and B2B billing in the same application.

Enable billing
To enable billing for your application, navigate to the Billing Settings page in the Clerk Dashboard. This page will guide you through enabling billing for your application.

Clerk billing costs just 0.7% per transaction, plus Stripe's transaction fees which are paid directly to Stripe.

Payment gateway
Once you have enabled billing, you will see the following Payment gateway options for collecting payments via Stripe:

Clerk development gateway: A shared test Stripe account so developers can get started testing and building with billing in development without needing to create and configure a Stripe account.
Stripe account: Use your own Stripe account.
Create a plan
Subscription plans are what your users subscribe to. There is no limit to the number of plans you can create.

To create a plan, navigate to the Plans page in the Clerk Dashboard. Here, you can create, edit, and delete plans. To setup B2C billing, select the Plans for Users tab and select Add Plan. When creating a plan, you can also create features for the plan; see the next section for more information.

Tip

What is the Publicly available option?


Show details
Add features to a plan
Features make it easy to give entitlements to your plans. You can add any number of features to a plan.

You can add a feature to a plan when you are creating a plan. To add it after a plan is created:

Navigate to the Plans page in the Clerk Dashboard.
Select the plan you'd like to add a feature to.
In the Features section, select Add Feature.
Tip

What is the Publicly available option?


Show details
Create a pricing page
You can create a pricing page by using the <PricingTable /> component. This component displays a table of plans and features that users can subscribe to. It's recommended to create a dedicated page, as shown in the following example.

app/pricing/page.tsx

import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <PricingTable />
    </div>
  )
}
Control access with features and plans
You can use Clerk's features and plans to gate access to the content. There are a few ways to do this, but the recommended and simplest way is either using the has() method or the <Protect> component.

The has() method is available for any JavaScript framework, while <Protect> is only available for React-based frameworks.

Example: Using has()
Use the has() method to test if the user has access to a plan:


const { has } = await auth()
const hasPremiumAccess = has({ plan: 'gold' })
Or a feature:


const { has } = await auth()
const hasPremiumAccess = has({ feature: 'widgets' })
The has() method checks if the user has been granted a specific type of access control (role, permission, feature, or plan) and returns a boolean value. It is available on the auth object on the server. Depending on the framework you are using, you will access the auth object differently.

The following example accesses the auth object and the has() method using the Next.js-specific auth() helper.

Plan
Feature
The following example demonstrates how to use has() to check if a user has a feature.

app/page.tsx

import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  // Use `auth()` helper to access the `has()` method
  const { has } = await auth()

  // Use `has()` method to check if user has a Feature
  const hasPremiumAccess = has({ feature: 'premium_access' })

  if (!hasPremiumAccess)
    return <h1>Only subscribers with the Premium Access feature can access this content.</h1>

  return <h1>Our Exclusive Content</h1>
}
Example: Using <Protect>
The <Protect> component protects content or even entire routes by checking if the user has been granted a specific type of access control (role, permission, feature, or plan). You can pass a fallback prop to <Protect> that will be rendered if the user does not have the access control.

Plan
Feature
The following example demonstrates how to use <Protect> to protect a page by checking if the user has a feature.


export default function ProtectPage() {
  return (
    <Protect
      feature="premium_access"
      fallback={<p>Only subscribers with the Premium Access feature can access this content.</p>}
    >
      {children}
    </Protect>
  )
}


plan
export default function ProtectPage() {
  return (
    <Protect
      plan="bronze"
      fallback={<p>Only subscribers to the Bronze plan can access this content.</p>}
    >
      {children}
    </Protect>
  )
}