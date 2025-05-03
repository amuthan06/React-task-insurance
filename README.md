Insurance Management System
This is a web application for managing insurance policies and policyholders, built with React, TypeScript, Supabase, and Redux Toolkit. The app supports role-based access control (RBC) with three user roles: Admin, Agent, and Policyholder. It features a responsive UI, data visualizations, and secure data management.
Project Setup and Running Instructions
Prerequisites

Node.js (v18 or higher): Ensure Node.js is installed on your system.
npm: Comes with Node.js, used for package management.
Git: To clone the repository.
Supabase Account: For database and authentication services.
Cloudflare Pages Account: For hosting the application.

Setup Instructions

Clone the Repository:
cd insurance-management-system

Install Dependencies:Install the required npm packages:
npm install

Configure Environment Variables:

Create a .env file in the root directory.
Add your Supabase project URL and anon key (get these from your Supabase dashboard under Settings > API):VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

Set Up Supabase:

Create a Supabase project at supabase.com.
Set up the database schema as described in the "Database Schema Design" section below.
Enable Row-Level Security (RLS) on the policyholders and policies tables (see the "RBC Implementation" section for details).
Create a custom function get_policy_holder_users in Supabase SQL Editor to fetch policyholder users:CREATE OR REPLACE FUNCTION get_policy_holder_users()
RETURNS TABLE (id uuid, email text)
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email
  FROM auth.users u
  WHERE u.role = 'policy_holder';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

Run the Development Server:Start the development server using Vite:
npm run dev

The app will be available at http://localhost:5173.

Build for Production:Create a production build:
npm run build

The output will be in the dist folder.

Deploy to Cloudflare Pages:

Connect your repository to Cloudflare Pages:
Go to Pages > Create a project > Select your repository.
Set the build command to npm run build and the output directory to dist.

Deploy the site. The production URL will be https://insurance-cca.pages.dev.

Database Schema Design
The application uses Supabase as the backend, with the following schema:
Tables

policyholders Table:

Stores information about policyholders.
Schema:CREATE TABLE policyholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  region TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

policies Table:

Stores insurance policy details.
Schema:CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL,
  type TEXT NOT NULL,
  coverage INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  policyholder_id UUID NOT NULL REFERENCES policyholders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Relationships

One-to-Many: A policyholder can have multiple policies (via the policyholder_id foreign key in the policies table).
User Mapping: The user_id in the policyholders table links to the auth.users table in Supabase, associating each policyholder with a user account.

Row-Level Security (RLS)

RLS is enabled on both tables to enforce role-based access control (see the "RBC Implementation" section for details).

Justification for the Chosen State Management Library
Chosen Library: Redux Toolkit
We chose Redux Toolkit as the state management library for the following reasons:

Predictable State Management:

Redux Toolkit provides a centralized store for managing the app’s state, making it easier to track and debug state changes in a predictable manner.
This is particularly useful for managing complex data like policyholders and policies, which are fetched from Supabase and updated frequently.

Simplified Redux Setup:

Redux Toolkit reduces boilerplate compared to vanilla Redux by providing utilities like createSlice and createAsyncThunk.
For example, the policiesSlice and policyholdersSlice use createSlice to define reducers and createAsyncThunk to handle asynchronous API calls to Supabase.

Built-in Immutability Helpers:

Redux Toolkit uses immer under the hood, allowing us to write "mutating" logic in reducers while ensuring immutability, which simplifies state updates (e.g., adding, updating, or deleting policies).

Integration with React:

The @reduxjs/toolkit package integrates seamlessly with React via react-redux, providing hooks like useSelector and useDispatch for accessing and updating the store.
This makes it easy to manage global state in components like Dashboard and Policy.

Scalability:

As the application grows (e.g., adding more features like claims management), Redux Toolkit’s structure ensures the state management remains maintainable and scalable.

Alternatives Considered

React Context API: While simpler, Context API is less suitable for complex state management and frequent updates, as it can lead to performance issues due to unnecessary re-renders.
Zustand: A lightweight alternative, but lacks the robust ecosystem and tooling (e.g., Redux DevTools) that Redux Toolkit provides.
MobX: More flexible but less predictable than Redux, which can make debugging harder in a team setting.

Conclusion: Redux Toolkit strikes a balance between simplicity, predictability, and scalability, making it the best choice for this project.
Explanation of the RBC Implementation, Including Supabase RLS
Role-Based Control (RBC) Overview
The application implements role-based access control (RBC) with three roles:

Admin: Can manage policyholders and policies (create, update, delete).
Agent: Can manage policies (create, update status) but cannot manage policyholders.
Policyholder: Can view and edit their own policies (limited fields like coverage and dates).

Implementation Details

User Roles in Supabase:

User roles are stored in the auth.users table under user_metadata as a role field (e.g., { "role": "admin" }).
During signup (Signup.tsx), the role is set based on user selection and stored in user_metadata.
During login, the role is fetched using supabase.auth.getUser() and stored in the component state (e.g., in Dashboard.tsx and Policy.tsx).


Frontend Role-Based Logic:

The Policy.tsx component uses the userRole state to conditionally render UI elements:
Admins see the "Add Policyholder" form and can edit all policy fields.
Agents can add policies and edit the status field but cannot manage policyholders.
Policyholders can only edit their own policies (limited to coverage, start_date, and end_date).

The Dashboard.tsx component uses the role to filter data (e.g., Policyholders can only see their own policies).

Supabase Row-Level Security (RLS):

RLS is enabled on both policyholders and policies tables to enforce data access at the database level.
Policies for policyholders Table:-- Allow admins to select all policyholders
CREATE POLICY "Admins can select policyholders" ON policyholders
FOR SELECT
USING (auth.role() = 'admin');

-- Allow agents to select all policyholders
CREATE POLICY "Agents can select policyholders" ON policyholders
FOR SELECT
USING (auth.role() = 'agent');

-- Allow policyholders to select their own records
CREATE POLICY "Policyholders can select their own records" ON policyholders
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to insert policyholders
CREATE POLICY "Admins can insert policyholders" ON policyholders
FOR INSERT
WITH CHECK (auth.role() = 'admin');

Policies for policies Table:-- Allow admins to select all policies
CREATE POLICY "Admins can select policies" ON policies
FOR SELECT
USING (auth.role() = 'admin');

-- Allow agents to select all policies
CREATE POLICY "Agents can select policies" ON policies
FOR SELECT
USING (auth.role() = 'agent');

-- Allow policyholders to select their own policies
CREATE POLICY "Policyholders can select their own policies" ON policies
FOR SELECT
USING (
  auth.uid() = (
    SELECT user_id FROM policyholders WHERE id = policies.policyholder_id
  )
);

-- Allow admins and agents to insert policies
CREATE POLICY "Admins and agents can insert policies" ON policies
FOR INSERT
WITH CHECK (auth.role() IN ('admin', 'agent'));

-- Allow admins to update all policies
CREATE POLICY "Admins can update policies" ON policies
FOR UPDATE
USING (auth.role() = 'admin');

-- Allow agents to update policy status
CREATE POLICY "Agents can update policy status" ON policies
FOR UPDATE
USING (auth.role() = 'agent')
WITH CHECK (status IN ('Active', 'Expired', 'Pending'));

-- Allow policyholders to update their own policies (limited fields)
CREATE POLICY "Policyholders can update their own policies" ON policies
FOR UPDATE
USING (
  auth.uid() = (
    SELECT user_id FROM policyholders WHERE id = policies.policyholder_id
  )
)
WITH CHECK (
  coverage IS NOT NULL OR start_date IS NOT NULL OR end_date IS NOT NULL
);

-- Allow admins to delete policies
CREATE POLICY "Admins can delete policies" ON policies
FOR DELETE
USING (auth.role() = 'admin');

Custom Function for Policyholder Users:

The get_policy_holder_users function (defined in the setup instructions) allows admins to fetch users with the policy_holder role when adding a new policyholder.

Why Use Supabase RLS?

Security: RLS ensures that users can only access data they’re authorized to see, even if the frontend logic is bypassed.
Scalability: RLS policies are defined at the database level, making it easy to update access rules without changing the frontend code.
Simplicity: Supabase’s RLS integrates seamlessly with its authentication system, using auth.uid() and auth.role() to enforce access control.

Overview of the Charting Implementation and Data Handling for Visualizations
Charting Library: Chart.js with react-chartjs-2
The application uses Chart.js (via the react-chartjs-2 wrapper) to create visualizations in the Dashboard page. Four charts are implemented:

Policyholders Based on Region (PolicyholdersBasedOnRegionChart.tsx): A pie chart showing the distribution of policyholders by region.
Policy Count by Type and Status (PolicyCountByTypeAndStatusChart.tsx): A bar chart showing the count of policies by type and status.
Coverage Over Time (CoverageOverTimeChart.tsx): A line chart showing the total coverage amount over time.
Policy Distribution by Region (PolicyDistributionByRegionChart.tsx): A pie chart showing the distribution of policies by region.

Data Handling for Visualizations

Data Fetching:

Data is fetched from Supabase using Redux Toolkit thunks (fetchPolicyholders and fetchPolicies in policyholdersSlice.ts and policiesSlice.ts).
The Dashboard.tsx component uses useSelector to access the policyholders and policies state from the Redux store.
Data is fetched once on component mount via useEffect:useEffect(() => {
  dispatch(fetchPolicyholders())
  dispatch(fetchPolicies())
}, [dispatch])

Data Filtering:

The Dashboard allows users to filter data by Policy Status, Region, and Date Range:
Filters are managed using local state (statusFilter, regionFilter, dateRange).
Filtered data is computed dynamically:const policyholders =
  regionFilter !== 'none'
    ? rawPolicyholders.filter((ph) => ph.region === regionFilter)
    : rawPolicyholders

const policies = rawPolicies.filter((policy) => {
  const matchesStatus =
    statusFilter !== 'none' ? policy.status === statusFilter : true
  const policyholder = rawPolicyholders.find(
    (ph) => ph.id === policy.policyholder_id
  )
  const matchesRegion =
    regionFilter !== 'none' && policyholder
      ? policyholder.region === regionFilter
      : true
  const matchesDateRange =
    dateRange.start && dateRange.end
      ? policy.start_date <= dateRange.end &&
        policy.end_date >= dateRange.start
      : true

  return matchesStatus && matchesRegion && matchesDateRange
})

Filtered data is passed as props to the chart components.

Chart Data Preparation:

Each chart component transforms the filtered data into the format required by Chart.js:
Policyholders Based on Region:
Groups policyholders by region and counts them.
Example:const regions = [...new Set(policyholders.map((ph) => ph.region))]
const data = regions.map(
  (region) =>
    policyholders.filter((ph) => ph.region === region).length
)

Policy Count by Type and Status:
Groups policies by type and status, creating a stacked bar chart.

Coverage Over Time:
Aggregates coverage amounts by date, creating a line chart.

Policy Distribution by Region:
Maps policies to their policyholders’ regions and counts them.

Chart Rendering:

Each chart component uses react-chartjs-2 components (Pie, Bar, Line) to render the charts.
Example (from PolicyholdersBasedOnRegionChart.tsx):import { Pie } from 'react-chartjs-2'

const data = {
  labels: regions,
  datasets: [
    {
      label: 'Policyholders by Region',
      data: data,
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    },
  ],
}

return <Pie data={data} />

Charts are styled with Tailwind CSS and wrapped in Card components for a consistent UI.

Why Chart.js?

Lightweight: Chart.js is lightweight and performant, suitable for a frontend-heavy app.
React Integration: react-chartjs-2 provides a seamless integration with React, making it easy to pass data as props.
Customizability: Chart.js allows customization of colors, labels, and tooltips, which we use to match the app’s design.

Data Handling Considerations

Performance: Data is fetched once and stored in the Redux store, reducing API calls. Filters are applied on the client side for quick updates.
Security: RLS ensures users only see data they’re authorized to access (e.g., Policyholders can only see their own policies in the charts).
Scalability: The current implementation works well for small to medium datasets. For larger datasets, we could optimize by implementing pagination or server-side filtering.


This project provides a robust solution for insurance management with a focus on security, usability, and scalability. For any issues or contributions, please open an issue or pull request on the repository.
