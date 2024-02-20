import { Driver } from "neo4j-driver";
import { initDriver, initGraph } from "./graph";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

describe("Neo4j Graph", () => {
  it("should have environment variables defined", () => {
    expect(import.meta.env.SECRET_NEO4J_URI).toBeDefined();
    expect(import.meta.env.SECRET_NEO4J_USERNAME).toBeDefined();
    expect(import.meta.env.SECRET_NEO4J_PASSWORD).toBeDefined();
  });

  describe("initDriver", () => {
    it("should instantiate Driver", async () => {
      const driver = await initDriver();
      expect(driver).toBeInstanceOf(Driver);

      await driver.close();
    });
  });

  describe("initGraph", () => {
    it("should instantiate Neo4jGraph", async () => {
      const graph = await initGraph();

      expect(graph).toBeInstanceOf(Neo4jGraph);

      await graph.query("MERGE (t:DriverTest {working: true})");

      await graph.close();
    });
  });
});
