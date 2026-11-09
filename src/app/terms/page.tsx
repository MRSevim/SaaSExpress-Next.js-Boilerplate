import Container from "@/components/Container";

const page = () => {
  return (
    <Container className="flex-col justify-start flex-1">
      <h1 className="text-3xl font-bold mb-4">
        Terms and Conditions and Privacy Policy
      </h1>
      <p className="mb-4">
        Welcome to {process.env.APP_NAME}! These Terms and Conditions and
        Privacy Policy govern your use of our website and services. By accessing
        or using our platform, you agree to comply with these terms. Please read
        them carefully.
      </p>
      <h2 className="text-2xl font-bold mb-2">Terms and Conditions</h2>
      <p className="mb-4">
        These Terms and Conditions outline the rules and guidelines for using
        our website and services.
      </p>
      <h2 className="text-2xl font-bold mb-2">Privacy Policy</h2>
      <p className="mb-4">
        We value your privacy and are committed to protecting your personal
        information.
      </p>
    </Container>
  );
};

export default page;
