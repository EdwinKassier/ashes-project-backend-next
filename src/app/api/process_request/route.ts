import { NextResponse } from "next/server";
import { CryptoAnalysisService } from "@/domain/crypto/services/crypto-analysis.service";
import { GraphBuilderService } from "@/domain/crypto/services/graph-builder.service";
import { CryptoAnalysisSchema } from "@/domain/crypto/schemas/crypto.schemas";
import { CryptoDomainException } from "@/domain/crypto/exceptions/crypto.exceptions";
import { PrismaCryptoRepository } from "@/infrastructure/repositories/prisma-crypto.repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const investmentString = searchParams.get("investment");

    // Manually constructing object for Zod validation
    const input = {
      symbol: symbol || "",
      investment: investmentString ? parseFloat(investmentString) : 0,
    };

    // VALIDATION
    const validation = CryptoAnalysisSchema.safeParse(input);

    if (!validation.success) {
      return NextResponse.json(
        {
          result: validation.error.message,
          graph_data: validation.error.message,
        },
        { status: 400 },
      );
    }

    const { symbol: validSymbol, investment } = validation.data;

    // INFRASTRUCTURE
    const repository = new PrismaCryptoRepository();

    // SERVICES
    const analysisService = new CryptoAnalysisService(repository);
    const graphService = new GraphBuilderService();

    // Parallel execution for performance
    const [analysisResult, graphData] = await Promise.all([
      analysisService.analyze(validSymbol, investment),
      graphService.getGraphData(validSymbol),
    ]);

    return NextResponse.json({
      result: analysisResult,
      graph_data: graphData,
    });
  } catch (error: any) {
    if (error instanceof CryptoDomainException) {
      return NextResponse.json(
        { result: error.message, graph_data: error.message },
        { status: 400 }, // Legacy frontend expects success=false or error string?
        // Actually legacy code returned result="Symbol doesn't exist" in the JSON body.
        // We will match that behavior for now but with proper HTTP codes.
      );
    }

    console.error("Unhandled API Error:", error);
    return NextResponse.json(
      { result: "Internal Server Error", graph_data: "Internal Server Error" },
      { status: 500 },
    );
  }
}
